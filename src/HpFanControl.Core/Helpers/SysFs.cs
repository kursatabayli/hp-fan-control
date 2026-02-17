using System.Buffers.Text;
using System.Text;
using Microsoft.Extensions.Logging;

namespace HpFanControl.Core.Helpers;

public static class SysFs
{
    public static ILogger? Logger { get; set; }

    public static int ParseInt(ReadOnlySpan<byte> buffer)
    {
        var trimmed = TrimSpan(buffer);

        if (Utf8Parser.TryParse(trimmed, out int result, out _))
        {
            return result;
        }

        return 0;
    }

    public static int ReadInt(ref FileStream? stream, string path, byte[] buffer)
    {
        try
        {
            EnsureStreamOpen(ref stream, path, FileAccess.Read);

            if (stream == null) return 0;

            stream.Seek(0, SeekOrigin.Begin);

            int bytesRead = stream.Read(buffer, 0, buffer.Length);

            if (bytesRead > 0)
            {
                return ParseInt(buffer.AsSpan(0, bytesRead));
            }
        }
        catch (Exception ex)
        {
            Logger?.LogError(ex, "Failed to read integer from {Path}", path);
            ResetStream(ref stream);
        }
        return 0;
    }

    public static void WriteBytes(ref FileStream? stream, string path, ReadOnlySpan<byte> data)
    {
        try
        {
            EnsureStreamOpen(ref stream, path, FileAccess.Write);

            if (stream == null) return;

            stream.Seek(0, SeekOrigin.Begin);

            stream.Write(data);
            stream.Flush();
        }
        catch (Exception ex)
        {
            Logger?.LogError(ex, "Failed to write bytes to {Path}", path);
            ResetStream(ref stream);
        }
    }

    public static bool CheckContentEquals(ref FileStream? stream, string path, ReadOnlySpan<byte> expected, byte[] buffer)
    {
        try
        {
            EnsureStreamOpen(ref stream, path, FileAccess.Read);

            if (stream == null) return false;

            stream.Seek(0, SeekOrigin.Begin);
            int bytesRead = stream.Read(buffer, 0, buffer.Length);

            if (bytesRead < expected.Length) return false;

            var fileContent = buffer.AsSpan(0, bytesRead);

            return fileContent.IndexOf(expected) >= 0;
        }
        catch (Exception ex)
        {
            Logger?.LogError(ex, "Failed to check content of {Path}", path);
            ResetStream(ref stream);
            return false;
        }
    }

    public static bool CheckContentEquals(ref FileStream? stream, string path, string expected, byte[] buffer)
    {
        Span<byte> expectedBytes = stackalloc byte[Encoding.ASCII.GetByteCount(expected)];
        Encoding.ASCII.GetBytes(expected, expectedBytes);

        return CheckContentEquals(ref stream, path, expectedBytes, buffer);
    }

    #region Helper Methods

    private static void EnsureStreamOpen(ref FileStream? stream, string path, FileAccess access)
    {
        if (stream != null) return;

        if (!File.Exists(path))
        {
            Logger?.LogWarning("File not found: {Path}", path);
            return;
        }

        stream = new FileStream(path, FileMode.Open, access, FileShare.ReadWrite);
    }

    private static void ResetStream(ref FileStream? stream)
    {
        try
        {
            stream?.Dispose();
        }
        catch { }
        stream = null;
    }

    public static ReadOnlySpan<byte> TrimSpan(ReadOnlySpan<byte> span)
    {
        int start = 0;
        while (start < span.Length && IsWhitespace(span[start]))
        {
            start++;
        }

        int end = span.Length - 1;
        while (end >= start && IsWhitespace(span[end]))
        {
            end--;
        }

        if (start > end) return ReadOnlySpan<byte>.Empty;

        return span.Slice(start, end - start + 1);
    }

    private static bool IsWhitespace(byte b)
    {
        return b == 32 || b == 9 || b == 10 || b == 13;
    }

    #endregion
}