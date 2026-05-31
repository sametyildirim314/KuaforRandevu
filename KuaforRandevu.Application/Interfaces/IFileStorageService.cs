using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace KuaforRandevu.Application.Interfaces;

public interface IFileStorageService
{
    /// <summary>
    /// Dosyayı sunucuya kaydeder ve erişilebilir public URL'sini döner.
    /// </summary>
    Task<string> SaveFileAsync(Stream fileStream, string fileName, string subFolder, CancellationToken ct = default);

    /// <summary>
    /// Belirtilen URL'deki dosyayı sunucudan siler.
    /// </summary>
    Task DeleteFileAsync(string fileUrl, CancellationToken ct = default);
}
