"use client";

import { motion } from "framer-motion";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-8 flex items-end justify-between gap-4"
    >
      <div>
        <h1 className="text-2xl font-medium tracking-tight text-white">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-white/45">{subtitle}</p>}
      </div>
      {action}
    </motion.div>
  );
}
