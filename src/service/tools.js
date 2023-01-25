import axios from "axios";
import store from "../store";
export async function getSessionInfo() {
    try {
        // 获取会话信息
        const { data: info } = await axios.get(
            localStorage.addr + "/sessionInfo?sessionKey=" + localStorage.sessionKey
        );
        store.commit("sessionInfo", info.data);
    } catch (err) {
        throw new Error(err);
    }
}