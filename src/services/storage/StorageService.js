const fs = require('fs');
const { Pool } = require('pg');
const NotFoundError = require('../../exceptions/NotFoundError');

class StorageService {
    constructor(folder) {
        this._pool = new Pool();
        this._folder = folder;

        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
        }
    }

    async writeFile(file, meta, id) {
        const filename = +new Date() + meta.filename;
        const path = `${this._folder}/${filename}`;

        const fileStream = fs.createWriteStream(path);

        const query = {
            text: 'UPDATE albums SET cover= $1 WHERE id = $2 RETURNING id',
            values: [filename, id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
        }

        return new Promise((resolve, reject) => {
            fileStream.on('error', (error) => reject(error));
            file.pipe(fileStream);
            file.on('end', () => resolve(filename));
        });
    }
}

module.exports = StorageService;