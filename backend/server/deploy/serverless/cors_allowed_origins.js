const allowedOriginsProd = [
    'https://mjourard.github.io',
]
const allowedOriginsDev = [
    'http://127.0.0.1:4000'
]

const getAllowedOrigins = async ({options, resolveVariable }) => {
    const onlyUnique = (value, index, self) => {
        return self.indexOf(value) === index;
    }
    const stage = await resolveVariable('self:provider.stage');
    switch(stage) {
        case 'prod':
            return allowedOriginsProd.filter(onlyUnique);
        case 'dev':
        default:
            return allowedOriginsDev.filter(onlyUnique);
    }

}

const getAllowedOriginsStr = async ({options, resolveVariable }) => {
    const allowedOrigins = await resolveVariable('self:custom.CORS.ALLOWED_ORIGINS');
    return allowedOrigins.filter(origin => origin.length > 0).join(',');
}

module.exports = { getAllowedOrigins, getAllowedOriginsStr }
