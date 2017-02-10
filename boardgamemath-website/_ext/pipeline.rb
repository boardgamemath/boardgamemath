require File.expand_path '../haml/filters/asciidoc.rb', __FILE__
require 'boardgamemath'

Awestruct::Extensions::Pipeline.new do
	helper Awestruct::Extensions::Partial
	helper Awestruct::Extensions::Relative
	helper Awestruct::Extensions::BoardGameMath

  extension Awestruct::Extensions::Disqus.new
  extension Awestruct::Extensions::Sitemap.new()
end
