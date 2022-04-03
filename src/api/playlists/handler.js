const ClientError = require('../../exceptions/ClientError');

class PlaylistsHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
        this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
        this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
        this.postPlaylistSongsHandler = this.postPlaylistSongsHandler.bind(this);
        this.getPlaylistSongsHandler = this.getPlaylistSongsHandler.bind(this);
        this.deletePlaylistSongByIdHandler = this.deletePlaylistSongByIdHandler.bind(this);

    }

    async postPlaylistHandler(request, h) {
        try {
            this._validator.validatePostPlaylistPayload(request.payload);
            const { name } = request.payload;
            const { id: credentialId } = request.auth.credentials;

            const playlistId = await this._service.addPlaylist({
                name,
                owner: credentialId,
            });

            const response = h.response({
                status: 'success',
                message: 'Playlist berhasil ditambahkan',
                data: {
                    playlistId,
                },
            });
            response.code(201);
            return response;
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }

            // Server ERROR!
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });
            response.code(500);
            console.error(error);
            return response;
        }
    }

    async getPlaylistsHandler(request) {
        const { id: credentialId } = request.auth.credentials;
        const playlists = await this._service.getPlaylists(credentialId);
        return {
            status: 'success',
            data: {
                playlists,
            },
        };
    }


    async deletePlaylistByIdHandler(request, h) {
        try {
            const { id } = request.params;
            const { id: credentialId } = request.auth.credentials;

            await this._service.verifyPlaylistOwner(id, credentialId);
            await this._service.deletePlaylistById(id);

            return {
                status: 'success',
                message: 'Playlist berhasil dihapus',
            };
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }

            // Server ERROR!
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });
            response.code(500);
            console.error(error);
            return response;
        }
    }
    async postPlaylistSongsHandler(request, h) {
        try {
            this._validator.validatePostPlaylistSongPayload(request.payload);
            const { id } = request.params;
            const { songId } = request.payload;
            const { id: credentialId } = request.auth.credentials;
            await this._service.verifyPlaylistOwner(id, credentialId);

            const playlistSongId = await this._service.addSongToPlaylist({
                id,
                songId
            });

            const response = h.response({
                status: 'success',
                message: 'Playlist Song berhasil ditambahkan',
                data: {
                    playlistSongId,
                },
            });
            response.code(201);
            return response;
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }

            // Server ERROR!
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });
            response.code(500);
            console.error(error);
            return response;
        }
    }
    async getPlaylistSongsHandler(request, h) {
        try {
            const { id } = request.params;

            const { id: credentialId } = request.auth.credentials;
            await this._service.verifyPlaylistOwner(id, credentialId);
            const playlist = await this._service.getPlaylistById(id);
            playlist.songs = await this._service.getSongPlaylist(id);
            return {
                status: 'success',
                data: {
                    playlist
                },
            };
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }

            // Server ERROR!
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });
            response.code(500);
            console.error(error);
            return response;
        }

    }

    async deletePlaylistSongByIdHandler(request, h) {
        try {
            const { id } = request.params;
            const { id: credentialId } = request.auth.credentials;
            const { songId } = request.payload;

            await this._service.verifyPlaylistOwner(id, credentialId);
            await this._service.deleteSongPlaylist(id, songId);

            return {
                status: 'success',
                message: 'Playlist Song berhasil dihapus',
            };
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }

            // Server ERROR!
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });
            response.code(500);
            console.error(error);
            return response;
        }
    }




}

module.exports = PlaylistsHandler;