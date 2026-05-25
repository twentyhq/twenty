# Serviço "worker" — mesma imagem oficial, mas roda o processador de filas (BullMQ).
FROM twentycrm/twenty:latest
CMD ["yarn", "worker:prod"]
