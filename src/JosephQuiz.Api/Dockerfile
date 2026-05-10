FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["global.json", "."]
COPY ["Directory.Build.props", "."]
COPY ["Directory.Packages.props", "."]
COPY ["JosephQuiz.sln", "."]
COPY ["src/JosephQuiz.Api/JosephQuiz.Api.csproj", "src/JosephQuiz.Api/"]
COPY ["src/JosephQuiz.Application/JosephQuiz.Application.csproj", "src/JosephQuiz.Application/"]
COPY ["src/JosephQuiz.Domain/JosephQuiz.Domain.csproj", "src/JosephQuiz.Domain/"]
COPY ["src/JosephQuiz.Infrastructure/JosephQuiz.Infrastructure.csproj", "src/JosephQuiz.Infrastructure/"]
COPY ["src/JosephQuiz.Shared/JosephQuiz.Shared.csproj", "src/JosephQuiz.Shared/"]

RUN dotnet restore "src/JosephQuiz.Api/JosephQuiz.Api.csproj"

COPY . .

RUN dotnet publish "src/JosephQuiz.Api/JosephQuiz.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 10000

ENTRYPOINT ["sh", "-c", "dotnet JosephQuiz.Api.dll --urls http://0.0.0.0:${PORT:-10000}"]
