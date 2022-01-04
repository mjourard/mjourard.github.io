import axios from "axios";

(function () {

    // noinspection JSUnresolvedVariable
    const isUserFacing = IS_USER_FACING;
    async function pageLoad() {
        // noinspection JSUnresolvedVariable
        const instance = axios.create({
            baseURL: TRACKER_API_BASE_URL,
            timeout: 10001,
            headers: {
                //http/2 requires lowercase headers
                "prev-referrer": document.referrer
            }
        })
        const start = Date.now();
        try {
            const response = await instance.get('/page-load', {
                params: {
                    w: getWindowWidth(),
                    h: getWindowHeight(),
                    path: getPath()
                }
            });
            if (!isUserFacing) {
                const end = Date.now();
                console.log({
                    msg: 'tracking successful!',
                    time: end - start,
                    status: response.status,
                    body: response.data
                })
            }
        } catch (error) {
            if (!isUserFacing) {
                const end = Date.now();
                console.error({
                    msg: 'tracking failed...',
                    time: end - start,
                    ...error
                });
            }
        }
    }

    function getWindowWidth() {
        return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    }

    function getWindowHeight() {
        return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    }
    function getPath() {
        let path = "no_document_url";
        if (!!document.URL) {
            try {
                const url = new URL(document.URL);
                path = url.pathname;
            } catch (error) {
                path = error;
            }
        }
        return path;
    }
    document.addEventListener('DOMContentLoaded', function() {
        pageLoad()
            .then(() => {
                if (!isUserFacing) {
                    console.log('pageLoad success!');
                }
            });
    });
})();
