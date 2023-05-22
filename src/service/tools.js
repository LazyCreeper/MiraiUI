import axios from "axios";
import store from "../store";
export async function getSessionInfo() {
    try {
        // 获取会话信息
        const { data: info } = await axios.get(
            localStorage.addr + "/sessionInfo?sessionKey=" + localStorage.sessionKey
        );

        //   如果认证失败
        if (info.code != 0) {
            store.commit("error", {
                msg: info.msg
            });
            window.location.href = '/#/Error'
        } else {
            store.commit("sessionInfo", info.data);
            store.commit("isLogin", true);
            return
        }
    } catch (err) {
        store.commit("error", {
            msg: err.message
        });
        window.location.href = '/#/Error'
        console.error(err.message);
        return false
        // throw new Error(err);
    }
}

// 自己用又不是别人用，不用怕乱传参数
export function ws(type = 'all') {
    return new WebSocket(`ws://${localStorage.addr.split("//")[1]}/${type}?verifyKey=${localStorage.verifyKey}&qq=${localStorage.qq}&sessionKey=${localStorage.sessionKey}`)
}