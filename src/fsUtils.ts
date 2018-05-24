
import * as fs from 'fs';

const readFile = (path:string, opts:string = 'utf8') =>
    new Promise((res, rej) => {
        fs.readFile(path, opts, (err:NodeJS.ErrnoException, data:string) => {
            if (err) rej(err);
            else res(data);
        });
    });

const writeFile = (path:string, data:string, opts:string = 'utf8') =>
    new Promise((res, rej) => {
        fs.writeFile(path, data, opts, (err:NodeJS.ErrnoException) => {
            if (err) rej(err);
            else res();
        });
    });

export {
    readFile,
    writeFile
};