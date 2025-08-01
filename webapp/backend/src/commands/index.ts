import { logger } from '@/utils/logger';

import { CronJob } from 'cron';
import fs from 'fs';
import path from 'path';

import commands from './commands.json';

const startCronJobs = () => {
    commands.forEach((command) => {
        const commandFile = path.join(__dirname, command.file);

        // Check if the file exists before executing it
        if (!fs.existsSync(commandFile)) {
            logger.error(`[Cron] File not found: ${commandFile}`);
            return;
        }

        const job = new CronJob(command.cronExpression, async () => {
            try {
                const { main } = require(commandFile);
                if (typeof main === 'function') {
                    await main();
                } else {
                    logger.error(`[Cron] The main function does not exist in ${commandFile}`);
                }
            } catch (error) {
                logger.error(`[Cron] Error executing ${commandFile}:`, error);
            }
        });

        job.start();
    });
};

export default startCronJobs;
