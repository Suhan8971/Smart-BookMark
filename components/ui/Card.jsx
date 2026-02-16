'use client'

import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

export const Card = ({ children, className, ...props }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn("glass rounded-xl p-6 transition-all", className)}
            {...props}
        >
            {children}
        </motion.div>
    )
}
