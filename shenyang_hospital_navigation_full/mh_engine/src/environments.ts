const meta = import.meta.env;

export default {
    serverOrigin:
        meta.VITE_SERVER_ORIGIN ||
        (meta.PROD ? "https://mh-admin-server.onrender.com" : "http://localhost:8000"),
};
