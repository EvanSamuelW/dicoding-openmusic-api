const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');



class AlbumLikesService {
    constructor(cacheService) {
        this._pool = new Pool();
        this._cacheService = cacheService;
    }

    async getAlbumById(id) {
        const query = {
            text: 'SELECT * FROM albums WHERE id = $1',
            values: [id],
        };
        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Album tidak ditemukan');
        }

        return result.rows[0];
    }


    async getAlbumLikesById(id, user_id) {
        const query = {
            text: 'SELECT * FROM user_album_likes WHERE user_id = $1 and album_id = $2',
            values: [user_id, id],
        };
        const result = await this._pool.query(query);

        // if (!result.rows.length) {
        //     throw new NotFoundError('Album tidak ditemukan');
        // }

        return result.rows[0];
    }
    async addAlbumLikes({ user_id, album_id }) {
        const id = nanoid(16);
        const query2 = {
            text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
            values: [id, user_id, album_id],
        };

        const result2 = await this._pool.query(query2);

        if (!result2.rows[0].id) {
            throw new InvariantError('Album Likes gagal ditambahkan');
        }
        await this._cacheService.delete(`albums:${album_id}`);

        return result2.rows[0].id;
    }


    async getAlbumLikes(id) {
        try {
            const result = await this._cacheService.get(`albums:${id}`)
            const obj = {};
            obj.count = result;
            obj.cache = 'cache';
            return obj;

        } catch (error) {
            const query = {
                text: 'SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1',
                values: [id],
            };
            const result = await this._pool.query(query);

            if (!result.rows.length) {
                throw new NotFoundError('Album tidak ditemukan');
            }
            const mappedResult = result.rows[0].count;
            await this._cacheService.set(`albums:${id}`, JSON.stringify(mappedResult));
            return mappedResult;
        }

    }
    async dislikeAlbum(user_id, id) {

        const query = {
            text: 'DELETE FROM user_album_likes WHERE user_id = $1 and album_id = $2 RETURNING id,album_id',
            values: [user_id, id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Album Berhasil di dislike');
        }
        await this._cacheService.delete(`albums:${result.rows[0].album_id}`);

        return result.rows[0];
    }

}

module.exports = AlbumLikesService;