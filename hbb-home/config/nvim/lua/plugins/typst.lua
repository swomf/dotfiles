return {
  {
    "neovim/nvim-lspconfig",
    opts = {
      servers = {
        tinymist = {
          settings = {
            formatterMode = "typstyle",
            formatterIndentSize = 2,
            formatterPrintWidth = 100,
            formatterProseWrap = true,
          },
        },
      },
    },
  },
  {
    "chomosuke/typst-preview.nvim",
    opts = {
      -- 127.0.0.1 css override should have
      -- #typst-app.invert-colors .typst-doc {
      -- filter: invert(1) hue-rotate(180deg) !important;
      -- }
      -- for true black bg.
      invert_colors = "always",
    },
  },
}
