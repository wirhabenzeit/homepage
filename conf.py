# Configuration file for the Sphinx documentation builder.
#
# This file only contains a selection of the most common options. For a full
# list see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Path setup --------------------------------------------------------------

# If extensions (or modules to document with autodoc) are in another directory,
# add these directories to sys.path here. If the directory is relative to the
# documentation root, use os.path.abspath to make it absolute, like shown here.
#
# import os
# import sys
# sys.path.insert(0, os.path.abspath('.'))


# -- Project information -----------------------------------------------------

project = 'Dominik Schröder'
copyright = '2022, Dominik Schröder'
# author = 'Dominik Schröder'

from typing import Any, Dict

redirects = {
     "index": "cv.html"
}

# -- General configuration ---------------------------------------------------

# Add any Sphinx extension module names here, as strings. They can be
# extensions coming with Sphinx (named 'sphinx.ext.*') or your custom
# ones.
extensions = [
    "sphinx_proof",
    "myst_parser",
    "sphinx_togglebutton",
    'sphinx_math_dollar', 
    'sphinx.ext.mathjax',
    "sphinxcontrib.bibtex"
]

myst_enable_extensions = [
    "amsmath",
    "colon_fence",
    "deflist",
    "dollarmath",
    "fieldlist",
    "html_admonition",
    "html_image",
    "replacements",
    "smartquotes",
    "strikethrough",
    "substitution",
    "tasklist",
]

myst_dmath_double_inline = True
myst_dmath_allow_space=True
myst_dmath_allow_digits=True
myst_title_to_header=True 

# Add any paths that contain templates here, relative to this directory.
templates_path = ['_templates']

# List of patterns, relative to source directory, that match files and
# directories to ignore when looking for source files.
# This pattern also affects html_static_path and html_extra_path.
exclude_patterns = ['_build', 'Thumbs.db', '.DS_Store']


# -- Options for HTML output -------------------------------------------------

# The theme to use for HTML and HTML Help pages.  See the documentation for
# a list of builtin themes.
#
html_theme = "sphinx_book_theme"

# Add any paths that contain custom static files (such as style sheets) here,
# relative to this directory. They are copied after the builtin static files,
# so a file named "default.css" will overwrite the builtin "default.css".
html_static_path = ['_static']

html_theme_options = {
    "sidebar_hide_name": True,
    "use_download_button": False,
    "logo_only": True,
    "home_page_in_toc": True,
    "use_fullscreen_button": False,
    "extra_navbar": "",
    "use_sidenotes": True
}

html_sidebars = {
    "**": ["sidebar-logo.html","sbt-sidebar-nav.html"]
}

html_logo = "dominik2021-1.jpg"
html_title = ""

import re
from pybtex.richtext import Symbol, Text
from pybtex.style.formatting.unsrt import Style as UnsrtStyle
from pybtex.style.formatting import toplevel
from pybtex.style.labels import BaseLabelStyle
from pybtex.plugin import register_plugin
from pybtex.style.template import (
    field, first_of, href, join, names, optional, optional_field, sentence,
    tag, together, words
)

bibtex_bibfiles = ["refs.bib"]
bibtex_default_style = 'plain'
bibtex_reference_style = "super"
bibtex_default_style = 'mystyle'

html_show_copyright = False
html_show_sphinx = False

def dashify(text):
    dash_re = re.compile(r'-+')
    return Text(Symbol('ndash')).join(text.split(dash_re))

pages = field('pages', apply_func=dashify)

date = words [optional_field('month'), field('year')]

class MyStyle(UnsrtStyle):
    def format_title(self, e, which_field, as_sentence=True):
        formatted_title = tag('em') [ field(which_field) ]
        if as_sentence:
            return sentence[ formatted_title ]
        else:
            return formatted_title
    def get_article_template(self, e):
        volume_and_pages = first_of [
            # volume and pages, with optional issue number
            optional [
                join [
                    field('volume'),
                    optional['(', field('number'),')'],
                    ':', pages
                ],
            ],
            # pages only
            words ['pages', pages],
        ]
        template = toplevel [
            self.format_title(e, 'title'),
            self.format_names('author'),
            sentence [
                tag('strong') [field('journal')],
                optional[ volume_and_pages ],
                tag('strong') [field('year')]],
            self.format_web_refs(e),
        ]
        return template

    def format_web_refs(self, e):
        # based on urlbst output.web.refs
        return sentence(capfirst=False) [
            optional [ self.format_eprint(e) ],
            optional [ self.format_pubmed(e) ],
            optional [ self.format_doi(e) ],
            optional [ self.format_mathscinet(e) ],
            ]

    def format_url(self, e):
        # based on urlbst format.url
        return href [
            field('url'),
            join(' ') [
                'URL:',
                field('url')
                ]
            ]

    def format_pubmed(self, e):
        # based on urlbst format.pubmed
        return href [
            join [
                'http://www.ncbi.nlm.nih.gov/pubmed/',
                field('pubmed')
                ],
            join [
                'PMID:',
                field('pubmed')
                ]
            ]

    def format_mathscinet(self, e):
        return href [
            join [
                'https://mathscinet.ams.org/mathscinet-getitem?mr=',
                field('mrnumber')
                ],
            join [
                'MR',
                field('mrnumber')
                ]
            ]


    def format_doi(self, e):
        # based on urlbst format.doi
        return href [
            join [
                'http://dx.doi.org/',
                field('doi')
                ],
            join [
                'doi:',
                field('doi')
                ]
            ]

    def format_eprint(self, e):
        # based on urlbst format.eprint
        return href [
            join [
                'http://arxiv.org/abs/',
                field('eprint')
                ],
            join [
                'arXiv:',
                field('eprint')
                ]
            ]

register_plugin('pybtex.style.formatting', 'mystyle', MyStyle)

# -- Options for theme development -------------------------------------------
# Make sure these are all set to the default values.

html_js_files = []
html_context: Dict[str, Any] = {}
# html_show_sphinx = False
html_show_copyright = True
# html_last_updated_fmt = ""

latex_theme = "howto"
#root_doc = "teaching/probability"
latex_documents=[('teaching/random_matrices_2017','random_matrices_2017.tex','Random Matrices','Dominik Schröder','howto')]
latex_elements = { 
'makeindex': '', 
'printindex': '', 
} 