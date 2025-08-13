import { motion } from "framer-motion";

import { ChatBubbleIcon } from "./icons";
import { InfoBanner } from "./info-banner";
import { useAuthContext } from "./session-provider";

export const Overview = () => {
  const { isAuthDisabled, isPersistenceDisabled } = useAuthContext();

  return (
    <motion.div
      key="overview"
      className="max-w-3xl mx-auto md:mt-20"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="flex flex-col gap-6 max-w-xl px-4">
        <div className="rounded-xl p-6 flex flex-col gap-8 leading-relaxed text-center">
          <p className="flex flex-row justify-center gap-4 items-center">
            <ChatBubbleIcon size={40} />
          </p>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Welcome to David AI
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Your intelligent assistant powered by advanced AI and integrated
            tools.
          </p>
        </div>
        <InfoBanner
          isAuthDisabled={isAuthDisabled}
          isPersistenceDisabled={isPersistenceDisabled}
        />
      </div>
    </motion.div>
  );
};
