class Utils {
    static getPath(path) {
        if(typeof path === 'object' && !(path instanceof Date)) return `${path.year}/${path.month}/${path.date}/latest.json`;
        else return `${path.getFullYear()}/${path.getMonth() + 1}/${path.getDate()}/latest.json`;
    }
}

module.exports = Utils;