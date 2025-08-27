export default function redirect (path) {
    window.location.href = `${window.location.origin}/${path}`;
}