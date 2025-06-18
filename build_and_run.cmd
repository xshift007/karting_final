@echo off
set COMPOSE_FILE=docker-compose-ha.yml

echo [1/3] Parando y borrando volúmenes...
docker-compose -f %COMPOSE_FILE% down -v

echo [2/3] Construyendo y levantando...
docker-compose -f %COMPOSE_FILE% up -d --build

echo Esperando 10s para que terminen de iniciar...
timeout /t 10 /nobreak >nul

echo [3/3] Probando endpoints...
echo Frontend status:
powershell -Command "(Invoke-WebRequest http://localhost:8070 -UseBasicParsing).StatusCode"
echo Backend /clients status:
powershell -Command "(Invoke-WebRequest http://localhost:8070/api/clients -UseBasicParsing).StatusCode"

pause
