using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using RoadMaintenance.Api.Auth;
using RoadMaintenance.Api.Common;
using RoadMaintenance.Api.Features.Analytics;
using RoadMaintenance.Api.Features.Incidents;
using RoadMaintenance.Api.Features.Machines;
using RoadMaintenance.Api.Features.Materials;
using RoadMaintenance.Api.Features.RoadSegments;
using RoadMaintenance.Api.Features.WorkOrders;
using RoadMaintenance.Infrastructure;
using RoadMaintenance.Infrastructure.Interfaces;
using Scalar.AspNetCore;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add Infrastructure services (EF Core, Identity, domain services)
builder.Services.AddInfrastructure(builder.Configuration);

#region Application services
builder.Services.AddScoped<IAuthService, AuthService>();

#endregion

#region Feature Handlers
// Register feature handlers (vertical slices)

builder.Services.Configure<IncidentDuplicateDetectionOptions>(
    builder.Configuration.GetSection(IncidentDuplicateDetectionOptions.SectionName));

// Incidents
builder.Services.AddScoped<ICreateIncidentHandler, CreateIncidentHandler>();
builder.Services.AddScoped<IGetIncidentsHandler, GetIncidentsHandler>();
builder.Services.AddScoped<IGetIncidentByIdHandler, GetIncidentByIdHandler>();
builder.Services.AddScoped<IVerifyIncidentHandler, VerifyIncidentHandler>();
builder.Services.AddScoped<IResolveIncidentHandler, ResolveIncidentHandler>();
builder.Services.AddScoped<IMarkIncidentAsDuplicateHandler, MarkIncidentAsDuplicateHandler>();

// Work Orders
builder.Services.AddScoped<ICreateWorkOrderHandler, CreateWorkOrderHandler>();
builder.Services.AddScoped<IGetWorkOrdersHandler, GetWorkOrdersHandler>();
builder.Services.AddScoped<IGetWorkOrderByIdHandler, GetWorkOrderByIdHandler>();
builder.Services.AddScoped<IUpdateWorkOrderStatusHandler, UpdateWorkOrderStatusHandler>();

// Road Segments
builder.Services.AddScoped<IGetRoadSegmentsHandler, GetRoadSegmentsHandler>();
builder.Services.AddScoped<IGetRoadSegmentByIdHandler, GetRoadSegmentByIdHandler>();
builder.Services.AddScoped<ICreateRoadSegmentHandler, CreateRoadSegmentHandler>();
builder.Services.AddScoped<IUpdateRoadSegmentHandler, UpdateRoadSegmentHandler>();
builder.Services.AddScoped<IUpdateRoadSegmentStatusHandler, UpdateRoadSegmentStatusHandler>();

// Materials
builder.Services.AddScoped<IMaterialsHandler, MaterialsHandler>();

// Machines
builder.Services.AddScoped<IMachinesHandler, MachinesHandler>();

// Analytics
builder.Services.AddScoped<IAnalyticsHandler, AnalyticsHandler>();

#endregion

#region JWT 
// Configure JWT settings 
var jwtSettings = builder.Configuration.GetSection(JwtSettings.SectionName).Get<JwtSettings>()
    ?? throw new InvalidOperationException("JWT settings are not configured.");

builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection(JwtSettings.SectionName));

// Configure JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SecretKey)),
        ClockSkew = TimeSpan.Zero
    };
});

#endregion

// Configure Authorization policies
builder.Services.AddAuthorizationBuilder()
    .AddPolicy("RequireDriverRole", policy => policy.RequireRole("Driver"))
    .AddPolicy("RequireFieldWorkerRole", policy => policy.RequireRole("FieldWorker"))
    .AddPolicy("RequireDispatcherRole", policy => policy.RequireRole("Dispatcher"))
    .AddPolicy("RequireMaintenanceManagerRole", policy => policy.RequireRole("MaintenanceManager"))
    .AddPolicy("RequireDispatcherOrManager", policy => policy.RequireRole("Dispatcher", "MaintenanceManager"));

builder.Services.AddControllers();

// Configure OpenAPI/Swagger
builder.Services.AddOpenApi();

// Configure CORS for React frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000", "https://prolific-nurturing-production-a530.up.railway.app") // Vite default ports
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddHttpContextAccessor(); // Neophodno za čitanje HTTP konteksta
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();

var app = builder.Build();

// Seed database (roles, etc.) on startup
await DataSeeder.SeedDatabaseAsync(app.Services);

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(options =>
    {
        options.Servers = [new ScalarServer("https://localhost:7204", "Local Dev")];
        options.Title = "Road Maintenance API";
        options.DefaultHttpClient = new KeyValuePair<ScalarTarget, ScalarClient>(ScalarTarget.JavaScript, ScalarClient.Axios);
    });
}

app.UseHttpsRedirection();

app.UseCors("AllowReactApp");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
app.Urls.Add($"http://0.0.0.0:{port}");

app.Run();

