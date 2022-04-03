const ClientError = require('../../exceptions/ClientError');

class AlbumLikesHandler {
    constructor(service) {
        this._service = service;

        this.postAlbumLikesHandler = this.postAlbumLikesHandler.bind(this);
        this.getAlbumLikesHandler = this.getAlbumLikesHandler.bind(this);
    }

    async postAlbumLikesHandler(request, h) {
        try {
            const { id } = request.params;
            const { id: credentialId } = request.auth.credentials;
            const album = await this._service.getAlbumById(id);
            const albumLikes1 = await this._service.getAlbumLikesById(id, credentialId);
            if (!album) {
                const response = h.response({
                    status: 'fail',
                    message: 'Album tidak ditemukan',
                });
                response.code(404);
                return response;
            }
            if (albumLikes1 != undefined) {
                if (albumLikes1.user_id == credentialId) {
                    await this._service.dislikeAlbum(credentialId, id);
                    const response = h.response({
                        status: 'success',
                        message: 'Album Dislike berhasil ditambahkan'
                    });
                    response.code(201);
                    return response;
                }

            }

            const albumLikes = await this._service.addAlbumLikes({
                album_id: id,
                user_id: credentialId
            });


            const response = h.response({
                status: 'success',
                message: 'Album Likes berhasil ditambahkan',
                data: {
                    albumLikes,
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


    async getAlbumLikesHandler(request, h) {
        try {
            const { id } = request.params;
            const likes = await this._service.getAlbumLikes(id);
            if (likes.cache == 'cache') {
                const response = h.response({
                    status: 'success',
                    data: {
                        likes: parseInt(likes),
                    },
                });
                response.header('X-Data-Source', 'cache');
                return response;
            }
            return {
                status: 'success',
                data: {
                    likes: parseInt(likes),
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

}

module.exports = AlbumLikesHandler;