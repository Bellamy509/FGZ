"use client";

import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { mutate } from "swr";

interface UseSpeechToTextReturn {
  isRecording: boolean;
  isTranscribing: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  transcript: string | null;
  error: string | null;
  clearTranscript: () => void;
}

export function useSpeechToText(): UseSpeechToTextReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setTranscript(null);

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus", // Better compression and quality
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());

        if (audioChunksRef.current.length > 0) {
          await processAudioData();
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error starting recording:", err);
      setError("Unable to access microphone. Please check permissions.");
      toast.error("Unable to access microphone");
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const processAudioData = useCallback(async () => {
    setIsTranscribing(true);

    try {
      // Create audio blob from chunks
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm;codecs=opus",
      });

      // Validate audio size (max 25MB)
      if (audioBlob.size > 25 * 1024 * 1024) {
        throw new Error("Audio file too large (max 25MB)");
      }

      // Create FormData and send to transcription API
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const response = await fetch("/api/mcp-chat/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 402) {
          throw new Error(errorData.error || "Insufficient credits");
        }

        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.transcript && data.transcript.trim()) {
        setTranscript(data.transcript.trim());
        toast.success("Audio transcribed successfully!");

        // Refresh user credits display after successful transcription
        mutate("/api/user/credits");
      } else {
        throw new Error("No speech detected in audio");
      }
    } catch (err) {
      console.error("Transcription error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Transcription failed";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsTranscribing(false);
      audioChunksRef.current = [];
    }
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript(null);
    setError(null);
  }, []);

  return {
    isRecording,
    isTranscribing,
    startRecording,
    stopRecording,
    transcript,
    error,
    clearTranscript,
  };
}
