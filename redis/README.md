# Redis stack

- Guarda aquí la configuración y scripts para Redis (compose, helm charts, config).
- Usa volúmenes nombrados y límites de memoria en `docker-compose.redis.yml` para evitar consumo innecesario.
- Mantén sólo un servicio Redis centralizado y con contraseña/autenticación si se expone fuera de la red interna.
