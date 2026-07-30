-- Keymaps are automatically loaded on the VeryLazy event
-- Default keymaps that are always set: https://github.com/LazyVim/LazyVim/blob/main/lua/lazyvim/config/keymaps.lua
-- Add any additional keymaps here

vim.keymap.set("n", "<leader>pv", function()
  local main = vim.b.vimtex and vim.b.vimtex.tex

  if not main or main == "" then
    vim.notify("VimTeX did not detect a main file", vim.log.levels.ERROR)
    return
  end

  local pdf = vim.fn.fnamemodify(main, ":t:r") .. ".pdf"
  vim.cmd("VimtexView " .. vim.fn.fnameescape(pdf))
end, {
  desc = "LaTeX forward search",
})
