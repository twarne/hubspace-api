import { createLogger, format, transports } from "winston";

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.errors({stack: true}),
        format.splat(),
        format.json()
    ),
    defaultMeta: { service: 'hubspace-api'},
    transports: [
        new transports.Console({level: 'debug'})
    ]
});

export default logger;