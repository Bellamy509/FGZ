import { relations } from "drizzle-orm/relations";
import {
  user,
  chatThread,
  project,
  chatMessage,
  account,
  session,
  mcpServerCustomInstructions,
  mcpServer,
  mcpServerToolCustomInstructions,
  workflow,
  workflowEdge,
  workflowNode,
} from "./schema";

export const chatThreadRelations = relations(chatThread, ({ one, many }) => ({
  user: one(user, {
    fields: [chatThread.userId],
    references: [user.id],
  }),
  chatMessages: many(chatMessage),
}));

export const userRelations = relations(user, ({ many }) => ({
  chatThreads: many(chatThread),
  projects: many(project),
  accounts: many(account),
  sessions: many(session),
  mcpServerCustomInstructions: many(mcpServerCustomInstructions),
  mcpServerToolCustomInstructions: many(mcpServerToolCustomInstructions),
  workflows: many(workflow),
}));

export const projectRelations = relations(project, ({ one }) => ({
  user: one(user, {
    fields: [project.userId],
    references: [user.id],
  }),
}));

export const chatMessageRelations = relations(chatMessage, ({ one }) => ({
  chatThread: one(chatThread, {
    fields: [chatMessage.threadId],
    references: [chatThread.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const mcpServerCustomInstructionsRelations = relations(
  mcpServerCustomInstructions,
  ({ one }) => ({
    user: one(user, {
      fields: [mcpServerCustomInstructions.userId],
      references: [user.id],
    }),
    mcpServer: one(mcpServer, {
      fields: [mcpServerCustomInstructions.mcpServerId],
      references: [mcpServer.id],
    }),
  }),
);

export const mcpServerRelations = relations(mcpServer, ({ many }) => ({
  mcpServerCustomInstructions: many(mcpServerCustomInstructions),
  mcpServerToolCustomInstructions: many(mcpServerToolCustomInstructions),
}));

export const mcpServerToolCustomInstructionsRelations = relations(
  mcpServerToolCustomInstructions,
  ({ one }) => ({
    user: one(user, {
      fields: [mcpServerToolCustomInstructions.userId],
      references: [user.id],
    }),
    mcpServer: one(mcpServer, {
      fields: [mcpServerToolCustomInstructions.mcpServerId],
      references: [mcpServer.id],
    }),
  }),
);

export const workflowRelations = relations(workflow, ({ one, many }) => ({
  user: one(user, {
    fields: [workflow.userId],
    references: [user.id],
  }),
  workflowEdges: many(workflowEdge),
  workflowNodes: many(workflowNode),
}));

export const workflowEdgeRelations = relations(workflowEdge, ({ one }) => ({
  workflow: one(workflow, {
    fields: [workflowEdge.workflowId],
    references: [workflow.id],
  }),
  workflowNode_source: one(workflowNode, {
    fields: [workflowEdge.source],
    references: [workflowNode.id],
    relationName: "workflowEdge_source_workflowNode_id",
  }),
  workflowNode_target: one(workflowNode, {
    fields: [workflowEdge.target],
    references: [workflowNode.id],
    relationName: "workflowEdge_target_workflowNode_id",
  }),
}));

export const workflowNodeRelations = relations(
  workflowNode,
  ({ one, many }) => ({
    workflowEdges_source: many(workflowEdge, {
      relationName: "workflowEdge_source_workflowNode_id",
    }),
    workflowEdges_target: many(workflowEdge, {
      relationName: "workflowEdge_target_workflowNode_id",
    }),
    workflow: one(workflow, {
      fields: [workflowNode.workflowId],
      references: [workflow.id],
    }),
  }),
);
