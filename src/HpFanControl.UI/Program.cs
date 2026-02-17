using System;
using HpFanControl.Core.Hardware.Implementations;
using HpFanControl.Core.Hardware.Interfaces;
using HpFanControl.Core.Services.Implementations;
using HpFanControl.Core.Services.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using MudBlazor.Services;
using Photino.Blazor;

namespace HpFanControl.UI;

class Program
{
    [STAThread]
    static void Main(string[] args)
    {
        var appBuilder = PhotinoBlazorAppBuilder.CreateDefault(args);

        appBuilder.Services.AddLogging(logging =>
                {
                    logging.ClearProviders();
                    logging.AddConsole();
                    logging.SetMinimumLevel(LogLevel.Information);
                });

        // register root component
        appBuilder.RootComponents.Add<App>("app");

        appBuilder.Services.AddSingleton<IHardwareService, HardwareService>();
        appBuilder.Services.AddSingleton<IConfigService, ConfigService>();
        appBuilder.Services.AddSingleton<IFanControllerService, FanControllerService>();
        appBuilder.Services.AddSingleton<ICpuSensor, CpuSensor>();
        appBuilder.Services.AddSingleton<IGpuSensor, GpuSensor>();
        appBuilder.Services.AddSingleton<IFanDriver, FanDriver>();

        appBuilder.Services.AddKeyedSingleton<IGpuProvider, NvidiaGpuProvider>("Discrete");
        appBuilder.Services.AddKeyedSingleton<IGpuProvider, IntegratedGpuProvider>("Integrated");

        appBuilder.Services.AddMudServices();


        var app = appBuilder.Build();


        var serviceProvider = app.Services;
        var logger = serviceProvider.GetRequiredService<ILogger<Program>>();

        AppDomain.CurrentDomain.UnhandledException += (sender, error) =>
        {
            var ex = error.ExceptionObject as Exception;
            logger.LogCritical(ex, "Fatal application crash detected!");

            app.MainWindow.ShowMessage("Fatal Error", ex?.Message ?? "Unknown error");
        };

        try
        {
            logger.LogInformation("Application bootstrapping...");

            var configService = serviceProvider.GetRequiredService<IConfigService>();
            var config = configService.Load();

            var fanController = serviceProvider.GetRequiredService<IFanControllerService>();
            fanController.LoadConfig(config);
            fanController.Start();

            logger.LogInformation("Fan Controller Service started successfully.");
        }
        catch (Exception ex)
        {
            logger.LogCritical(ex, "Failed to initialize services.");
        }

#if !DEBUG
    app.MainWindow.SetDevToolsEnabled(false).SetContextMenuEnabled(false);
#endif

        app.MainWindow
                    .SetIconFile("favicon.ico")
                    .SetTitle("HP Fan Control")
                    .SetLogVerbosity(0)
                    .SetUseOsDefaultSize(false)
                    .SetSize(1600, 900)
                    .Center();

        app.MainWindow.WindowClosing += (sender, e) =>
        {
            logger.LogInformation("Application closing...");

            try
            {
                var fanController = serviceProvider.GetRequiredService<IFanControllerService>();
                fanController.Stop();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error during shutdown sequence.");
            }

            return false;
        };

        app.Run();
    }
}