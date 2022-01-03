import axios from "axios";

async function pageLoad() {

    // noinspection JSUnresolvedVariable
    const isUserFacing = IS_USER_FACING;
    // noinspection JSUnresolvedVariable
    const instance = axios.create({
        baseURL: TRACKER_API_BASE_URL,
        timeout: 1000,
        headers: {
            "Prev-Referrer": document.referrer
        }
    })
    try {
        const response = await instance.get('/page-load', {
            params: {
                w: getWindowWidth(),
                h: getWindowHeight()
            }
        });
        if (isUserFacing) {
            console.log({
                status: response.status,
                body: response.data
            })
        }
    } catch(error) {
        if (isUserFacing) {
            console.error(error);
        }
    }
}

function getWindowWidth() {
    return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
}
function getWindowHeight() {
    return window.innerHeight|| document.documentElement.clientHeight || document.body.clientHeight;
}
