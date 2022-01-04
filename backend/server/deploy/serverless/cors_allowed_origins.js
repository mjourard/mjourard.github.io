const allowedOrigins = [
    'https://mjourard.github.io',
    'http://127.0.0.1:4000'
]

const getAllowedOrigins = () => {
    const onlyUnique = (value, index, self) => {
        return self.indexOf(value) === index;
    }
    return allowedOrigins.filter(onlyUnique);
}

const getAllowedOriginsStr = async ({options, resolveVariable }) => {
    const allowedOrigins = await resolveVariable('self:custom.CORS.ALLOWED_ORIGINS');
    return allowedOrigins.filter(origin => origin.length > 0).join(',');
}

module.exports = { getAllowedOrigins, getAllowedOriginsStr }
