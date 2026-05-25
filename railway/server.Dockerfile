# Deploy do Twenty na Railway a partir deste repo, SEM buildar o monorepo:
# apenas reusa a imagem oficial publicada (idêntica ao ambiente local).
# Serviço "server" — usa o CMD padrão da imagem (inicia o servidor web).
FROM twentycrm/twenty:latest
