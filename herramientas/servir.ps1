# Servidor local mínimo para probar la web sin Python ni Node.
# Uso, desde la raíz del repositorio:
#   powershell -ExecutionPolicy Bypass -File herramientas\servir.ps1
# y abrir http://localhost:8765/  (Ctrl+C para cortar). Sólo escucha en localhost.
param([string]$Root = (Split-Path -Parent $PSScriptRoot), [int]$Port = 8765)
$l = New-Object System.Net.HttpListener
$l.Prefixes.Add("http://localhost:$Port/")
$l.Start()
"Sirviendo $Root en http://localhost:$Port/"
$types = @{ ".html" = "text/html; charset=utf-8"; ".js" = "text/javascript; charset=utf-8"; ".json" = "application/json"; ".md" = "text/plain; charset=utf-8"; ".css" = "text/css; charset=utf-8"; ".svg" = "image/svg+xml"; ".webmanifest" = "application/manifest+json" }
while ($l.IsListening) {
  $c = $l.GetContext()
  $p = [Uri]::UnescapeDataString($c.Request.Url.AbsolutePath.TrimStart('/'))
  if ($p -eq "") { $p = "index.html" }
  $f = Join-Path $Root $p
  if (Test-Path $f -PathType Leaf) {
    $b = [IO.File]::ReadAllBytes($f)
    $ext = [IO.Path]::GetExtension($f)
    $c.Response.ContentType = $(if ($types[$ext]) { $types[$ext] } else { "application/octet-stream" })
    $c.Response.OutputStream.Write($b, 0, $b.Length)
  } else { $c.Response.StatusCode = 404 }
  $c.Response.Close()
}
