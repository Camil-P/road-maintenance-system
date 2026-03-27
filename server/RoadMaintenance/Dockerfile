FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

COPY RoadMaintenance.Api/RoadMaintenance.Api.csproj RoadMaintenance.Api/
COPY RoadMaintenance.Domain/RoadMaintenance.Domain.csproj RoadMaintenance.Domain/
COPY RoadMaintenance.Infrastructure/RoadMaintenance.Infrastructure.csproj RoadMaintenance.Infrastructure/

RUN dotnet restore RoadMaintenance.Api/RoadMaintenance.Api.csproj

COPY . .
RUN dotnet publish RoadMaintenance.Api/RoadMaintenance.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://0.0.0.0:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "RoadMaintenance.Api.dll"]