const mapDBToModel = ({
    id,
    title,
    year,
    performer,
    genre,
    duration,
    album_id

}) => ({
    id,
    title,
    performer
});

module.exports = { mapDBToModel };