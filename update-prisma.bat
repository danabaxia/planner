@echo off
echo Running Prisma commands with elevated privileges...
powershell -Command "Start-Process cmd -Verb RunAs -ArgumentList '/c cd %cd% && npx prisma generate && npx prisma migrate dev --name add_notion_schema_mapping'"
echo Done! 