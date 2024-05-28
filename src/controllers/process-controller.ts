import { Request, Response } from 'express'

export function info() {
    return (req: Request, res: Response) => {
        const payload = {
            version: process.version,
            versions: process.versions,
            arch: process.arch,
            platform: process.platform,
            features: process.features,
            env: process.env,
        }
        res.send({ process: payload });
    }
}
