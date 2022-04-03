require('dotenv').config();
const Jwt = require('@hapi/jwt');
const path = require('path');

const Hapi = require('@hapi/hapi');
const albums = require('./api/albums');
const AlbumsValidator = require('./validator/albums');
const AlbumsService = require('./services/postgres/AlbumsService');

const songs = require('./api/songs');
const SongsValidator = require('./validator/songs');
const SongsService = require('./services/postgres/SongsService');

const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users');

const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');

const playlists = require('./api/playlists');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const PlaylistsValidator = require('./validator/playlists');
const CacheService = require('./services/redis/CacheService');

const albumLikes = require('./api/albumLikes');
const AlbumLikesService = require('./services/postgres/AlbumLikesService');

const _exports = require('./api/exports');
const ProducerService = require('./services/rabbitmq/ProducerService');
const ExportsValidator = require('./validator/exports');
const Inert = require('@hapi/inert');

const uploads = require('./api/uploads');
const StorageService = require('./services/storage/StorageService');
const UploadsValidator = require('./validator/uploads');

const init = async() => {
    const usersService = new UsersService();
    const authenticationsService = new AuthenticationsService();
    const albumsService = new AlbumsService();
    const songsService = new SongsService();
    const playlistsService = new PlaylistsService();
    const cacheService = new CacheService();

    const albumLikesService = new AlbumLikesService(cacheService);

    const storageService = new StorageService(path.resolve(__dirname, 'api/uploads/file/images'));



    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.HOST,
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    });
    await server.register([{
            plugin: Jwt,
        },
        {
            plugin: Inert,
        },
    ]);

    server.auth.strategy('openmusic_jwt', 'jwt', {
        keys: process.env.ACCESS_TOKEN_KEY,
        verify: {
            aud: false,
            iss: false,
            sub: false,
            maxAgeSec: process.env.ACCESS_TOKEN_AGE,
        },
        validate: (artifacts) => ({
            isValid: true,
            credentials: {
                id: artifacts.decoded.payload.id,
            },
        }),
    });

    await server.register([{
            plugin: albums,
            options: {
                service: albumsService,
                validator: AlbumsValidator,
            },
        },
        {
            plugin: songs,
            options: {
                service: songsService,
                validator: SongsValidator,
            },
        },
        {
            plugin: users,
            options: {
                service: usersService,
                validator: UsersValidator,
            },
        },
        {
            plugin: authentications,
            options: {
                authenticationsService,
                usersService,
                tokenManager: TokenManager,
                validator: AuthenticationsValidator,
            },
        },
        {
            plugin: playlists,
            options: {
                service: playlistsService,
                validator: PlaylistsValidator,
            },
        },
        {
            plugin: _exports,
            options: {
                playlistsService: playlistsService,
                service: ProducerService,
                validator: ExportsValidator,
            },
        },
        {
            plugin: albumLikes,
            options: {
                service: albumLikesService,
            },
        },
        {
            plugin: uploads,
            options: {
                service: storageService,
                validator: UploadsValidator,
            },
        },

    ]);

    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
};

init();