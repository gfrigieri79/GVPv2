// sync.js - Motor de Sincronização GVP.OS via GitHub
const TitanSync = {
    getConfig: () => JSON.parse(localStorage.getItem('gtitan_sync_config')),

    saveConfig: (user, repo, token) => {
        const config = { user, repo, token };
        localStorage.setItem('gtitan_sync_config', JSON.stringify(config));
        alert("Configurações de nuvem salvas!");
    },

    upload: async function() {
        const config = this.getConfig();
        if (!config || !config.token) return alert("Configure o GitHub em Configurações primeiro.");

        try {
            const data = {};
            const keys = ['gtitan_tasks', 'gtitan_completed', 'gtitan_notes', 'gtitan_finances', 'gtitan_wallets', 'gtitan_health', 'gtitan_profile'];
            keys.forEach(k => data[k] = JSON.parse(localStorage.getItem(k)) || []);

            const url = `https://api.github.com/repos/${config.user}/${config.repo}/contents/db.json`;
            
            const fileRes = await fetch(url, {
                headers: { 'Authorization': `token ${config.token}` }
            });
            
            let sha = "";
            if (fileRes.ok) {
                const fileData = await fileRes.json();
                sha = fileData.sha;
            }

            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${config.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Sincronização GVP: ${new Date().toLocaleString()}`,
                    content: btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2)))),
                    sha: sha || undefined
                })
            });

            if (response.ok) alert("✅ Dados salvos na nuvem com sucesso!");
            else alert("❌ Erro ao subir. Verifique o nome do repositório e as permissões do token.");
        } catch (err) {
            console.error(err);
            alert("Erro de conexão.");
        }
    },

    download: async function() {
        const config = this.getConfig();
        if (!config) return alert("Configure o GitHub primeiro.");

        try {
            const url = `https://api.github.com/repos/${config.user}/${config.repo}/contents/db.json`;
            const res = await fetch(url, {
                headers: { 'Authorization': `token ${config.token}` }
            });
            
            if (!res.ok) throw new Error();
            
            const file = await res.json();
            const data = JSON.parse(decodeURIComponent(escape(atob(file.content))));

            Object.keys(data).forEach(key => {
                localStorage.setItem(key, JSON.stringify(data[key]));
            });

            alert("✅ Dados baixados com sucesso! O sistema será atualizado.");
            location.reload();
        } catch (err) {
            alert("❌ Erro ao baixar. Verifique se o arquivo db.json já existe no GitHub.");
        }
    }
};
