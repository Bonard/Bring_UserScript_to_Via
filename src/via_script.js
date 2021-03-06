/**
 * @class ViaScript: 转换 UserScript/油猴脚本 到 Via浏览器脚本
 * 
 * @author Xmader
 * @copyright Copyright (c) 2018 Xmader
 * 
 * Source Code: https://github.com/Xmader/Bring_UserScript_to_Via
 */

import { toBase64 } from "./base64.js"
import getGreasyforkId from "./get_greasyfork_id.js"

class ViaScript {
    constructor(user_script, id = getGreasyforkId() || `${new Date().getTime()}`) {
        this.header = user_script
            .split("==UserScript==")[1]
            .split("==/UserScript==")[0]

        this.id = id

        this.author = this.getHead("author")
        this.name = this.getHead("name")
        this.info = this.getHead("description")

        this.url = this.getHosts().size == 1 ? [...this.getHosts()][0] : "*"

        this.code = toBase64(this.getCode(user_script))

        delete this.header
    }

    getHead(head_name) {
        const head = this.header.match(`@${head_name}\\s+(.+)`)
        return head ? head[1] : ""
    }

    /**
     * @returns {String[]} 获取UserScript的所有`@match`和`@include`元属性
     */
    getMatches() {
        const r = /@match\s+(.+)/g
        const r1 = /@include\s+(.+)/g

        return (this.header.match(r) || this.header.match(r1) || ["*"])
            .map(x => x.replace(r, "$1").replace(r1, "$1"))
    }

    getHosts() {
        const r = /@match.+:\/\/(.+)\//g
        const r1 = /@include.+:\/\/(.+)\//g

        return new Set(
            (this.header.match(r) || this.header.match(r1) || ["*"])
                .map(x => x.replace(r, "$1").replace(r1, "$1"))
        )

    }

    getCode(user_script) {

        return `
(function () {

var matches = (['${this.getMatches().join("','")}']).map(function (x) {
    return !!location.href.match(x.replace(/\\*/g, ".*"))
})
        
if(!matches.includes(true)) return;

${user_script.split("==/UserScript==")[1]}
})();
        `
    }

    setId(id) {
        this.id = id
        return this
    }

    toString() {
        return JSON.stringify(this)
    }

    toObject() {
        return { ...this }
    }

    install() {
        if (window && window.via) {
            window.via.addon(
                toBase64(
                    this.toString()
                )
            )
        } else {
            throw new Error("安装失败: 需要使用Via浏览器")
        }
    }

    static from(...args) {
        return new ViaScript(...args)
    }
}

export default ViaScript
