import pathlib
here = pathlib.Path(__file__).parent
s = (here / 'v13.html').read_text()
css = (here / 'glass.css').read_text()
js = (here / 'glass.js').read_text()

s = s.replace('</style>', css + '\n</style>', 1)
s = s.replace('<div class="tb">', '<div class="tb glass">')
s = s.replace('<span class="dd">', '<span class="dd glass">')
s = s.replace('<span class="more">', '<span class="more glass">')
# glass filters are built per element after the view is shown
s = s.replace("show(only||'dash');",
              "show(only||'dash');\n</script>\n<script>\n" + js +
              "\nconst _show=show;show=k=>{_show(k);document.querySelectorAll('svg[data-glass]').forEach(e=>e.remove());applyGlass(document.querySelector('.view.on'))};\nshow(only||'dash');")
assert s.count('glass') > 5
(here / 'v14.html').write_text(s)
print('ok', len(s))
