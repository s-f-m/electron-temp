import fs from "fs";
import path from "path";
import {errorLogger} from "@/utils/logger";

export function deleteLog() {
    fs.watch(path.join(global.__static + "/../", "log"), {
            persistent: true,
            recursive: false,
        }, function (eventType, filename) {
            fs.readdir(path.join(global.__static + "/../", "log"), function (err, files) {
                for (let i = 0; i < files.length; i++) {
                    fs.stat(path.join(global.__static + "/../", "log/" + files[i]), ((error, stats) => {
                        if (!error) {
                            //stats.birthtimeMs为UTC时间
                            if (new Date().getTime() - 15 * 24 * 3600 * 1000 > new Date(stats.birthtimeMs + 3600 * 1000 * 8).getTime()) {
                                fs.unlink(path.join(global.__static + "/../", "log/" + files[i]), e => {
                                    if (e) {
                                        errorLogger(e)
                                    }
                                })
                            }
                        } else {
                            errorLogger(error)
                        }
                    }))
                }
            })
        }
    )
}