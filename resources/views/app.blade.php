<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>OpticalDesk - Professional OCR Document Processing</title>
    <meta name="description" content="Professional OCR document processing app with drag & drop upload, file validation, and webhook integration for business demos." />
    <meta name="author" content="OpticalDesk" />

    <meta property="og:title" content="optical-insight-desk" />
    <meta property="og:description" content="Lovable Generated Project" />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="https://lovable.dev/opengraph-image-p98pqg.png" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@lovable_dev" />
    <meta name="twitter:image" content="https://lovable.dev/opengraph-image-p98pqg.png" />
    @viteReactRefresh
    @vite('resources/react/main.tsx')
  </head>

  <body>
    <div id="root"></div>
  </body>
</html>
