'use strict'

const fs = require('fs').promises
const fg = require('fast-glob')
const path = require('path')
const { red, green, blue, cyan, bold } = require('kolorist')
const SVGSpriter = require('svg-sprite')

const plugin_name = 'html-inline-sprite-svg'
const default_options = {
	svgo: {
		plugins: ['removeComments']
	}
}

const generageSprite = async options => {
	const config = {
		mode: {
			symbol: {
				sprite: 'sprite.svg',
			}
		},
		svg: {
			xmlDeclaration: false
		},
		shape: {
			transform: [
				{
					svgo: {
						plugins: [
							'removeComments'
						]
					}
				}
			],
		},
	}
	const spriter = new SVGSpriter(config)

	const entries = await fg(path.join(options.icons, '**', '*.svg'), { dot: false })
	
	for (const entry of entries) {
		const relativePath = entry.replace(options.icons, '').replace(/^\//, '')
		const filedata = await fs.readFile(entry, 'utf-8')
		console.info(`${cyan(plugin_name)}\tsvg: ${relativePath}`)
		spriter.add(entry, relativePath, filedata)
	}

	const { result } = await spriter.compileAsync()
	return result.symbol.sprite.contents.toString('utf-8')
}

const htmlInlineSpriteSvg = options => {
	const _options = {
		...default_options,
		...options,
	}
	return {
		name: plugin_name,
		async transformIndexHtml(html) {
			
			const sprite = await generageSprite(_options)

			return {
				html,
				tags: [{
					tag: 'div',
					attrs: {
						style: 'width: 0; height: 0; position: absolute; overflow: hidden',
					},
					children: sprite,
					injectTo: 'body-prepend',
				}]
			}
		}
	}
}

module.exports = htmlInlineSpriteSvg
module.exports.default = module.exports