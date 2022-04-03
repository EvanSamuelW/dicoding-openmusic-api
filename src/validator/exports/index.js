const ExportAlbumsPlaylistsSchema = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const ExportsValidator = {
    validateExportPlaylistsPayload: (payload) => {
        const validationResult = ExportAlbumsPlaylistsSchema.validate(payload);

        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },
};

module.exports = ExportsValidator;