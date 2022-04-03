const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const { mapDBToModel3 } = require('../../utils3');
const ClientError = require('../../exceptions/ClientError');

class PlaylistsService {
    constructor() {
        this._pool = new Pool();
    }

    async addPlaylist({
        name,
        owner,
    }) {
        const id = nanoid(16);

        const query = {
            text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
            values: [id, name, owner],
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError('Playlist gagal ditambahkan');
        }

        return result.rows[0].id;
    }

    async getPlaylists(owner) {

        const query = {
            text: 'SELECT * FROM playlists join users on users.id = playlists.owner where playlists.owner = $1',
            values: [owner],
        };
        const result = await this._pool.query(query);
        return result.rows.map(mapDBToModel3);
    }

    async getPlaylistById(id) {
        const query = {
            text: `SELECT * FROM playlists left join users on users.id = playlists.owner where playlists.id = $1`,
            values: [id],
        };
        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('Playlist tidak ditemukan');
        }

        return result.rows.map(mapDBToModel3)[0];
    }

    async deletePlaylistById(id) {
        const query = {
            text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
        }
    }

    async verifyPlaylistOwner(id, owner) {
        const query = {
            text: `SELECT * FROM playlists WHERE id = $1`,
            values: [id],
        };
        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('Playlist tidak ditemukan');
        }

        if (result.rows[0].owner !== owner) {
            throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
        }
        return result;
    }


    async addSongToPlaylist({
        id,
        songId,
    }) {
        const uniqueId = nanoid(16);

        const query1 = {
            text: 'SELECT * FROM songs WHERE id = $1',
            values: [songId],
        };
        const result1 = await this._pool.query(query1);

        if (!result1.rows.length) {
            throw new NotFoundError('Lagu tidak ditemukan');
        }

        const query = {
            text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) returning id',
            values: [uniqueId, songId, id],
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError('Playlist Song gagal ditambahkan');
        }

        return result.rows[0].id;
    }


    async getSongPlaylist(id) {
        const query = {
            text: `SELECT songs.id, songs.title, songs.performer FROM songs JOIN playlist_songs ON songs.id = playlist_songs.song_id JOIN playlists ON playlists.id = playlist_songs.playlist_id where playlist_songs.playlist_id = $1`,
            values: [id],
        };
        const result = await this._pool.query(query);

        return result.rows;
    }

    async deleteSongPlaylist(id, songId) {

        const query1 = {
            text: 'SELECT * FROM songs WHERE id = $1',
            values: [songId],
        };
        const result1 = await this._pool.query(query1);

        if (!result1.rows.length) {
            throw new ClientError('Id Song tidak valid');
        }

        const query = {
            text: 'DELETE FROM playlist_songs WHERE song_id = $1 and playlist_id = $2 RETURNING id',
            values: [songId, id]
        };
        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new InvariantError('Playlist Song gagal dihapus');
        }
    }
}

module.exports = PlaylistsService;