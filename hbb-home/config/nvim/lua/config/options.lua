-- Options are automatically loaded before lazy.nvim startup
-- Default options that are always set: https://github.com/LazyVim/LazyVim/blob/main/lua/lazyvim/config/options.lua
-- Add any additional options here
vim.g.snacks_animate_scroll = false
vim.opt.conceallevel = 0

-- tabbing behavior
-- vim.opt.expandtab = false
-- vim.opt.tabstop = 4
-- vim.opt.shiftwidth = 4
-- vim.opt.softtabstop = 0

-- synctex setup
vim.g.vimtex_compiler_enabled = 0 -- i use swomf/latex-fast-compile
vim.g.vimtex_view_method = "zathura_simple"
-- see keymaps also, since i run zathura manually.
