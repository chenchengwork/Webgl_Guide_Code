/**
 * @description webpack 打包配置
 */
const webpack = require('webpack');
const CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;   // 提取公共库的插件
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');

// 编译排除的文件
const excludeRegex = /(node_modules|bower_modules)/;

// 格式化不同的样式loader
const formatStyleLoader = (otherLoader = null) => {
    const baseLoaders = [
        {
            loader: 'css-loader',
            options: {
                sourceMap: true
            }
        },
        {
            loader: 'postcss-loader',
            options: {
                sourceMap: true,
                ident: 'postcss', 	// https://webpack.js.org/guides/migrating/#complex-options
                plugins: () => [
                    require('postcss-flexbugs-fixes'),
                    autoprefixer({
                        browsers: [
                            '>1%',
                            'last 4 versions',
                            'Firefox ESR',
                            'not ie < 9' // React doesn't support IE8 anyway
                        ],
                        flexbox: 'no-2009'
                    })
                ]
            }
        }
    ];

    if(otherLoader) baseLoaders.push(otherLoader);

    return ExtractTextPlugin.extract(
        {
            fallback: 'style-loader',
            use: baseLoaders
        }
    )
};

module.exports = {
    // 用于生成源代码的mapping
    devtool: 'cheap-module-source-map',	// cheap-module-source-map,cheap-source-map

    entry: {
        app: ['./src/index'],
    },

    // 指定模块目录名称
    resolve: {
        extensions: ['.js', '.jsx'],
        modules: ['node_modules', 'web_modules']
    },

    output: {
        // 公网发布的目录
        publicPath: '/public/',
        // 编译的目录
        path: `${__dirname}/../public/`,
        filename: '[name].js'
    },

    module: {
        rules: [
            {
                test: /\.(png|jpg|gif)$/,
                use: 'url-loader?limit=8192' //  <= 8kb的图片base64内联
            },
            {
                test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
                use: 'url-loader?limit=10000&minetype=application/font-woff'
            },
            {
                test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
                use: 'url-loader?limit=10&minetype=application/font-woff'
            },
            {
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                use: 'url-loader?limit=10&minetype=application/octet-stream'
            },
            {
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                use: 'file-loader'
            },
            {
                test: /\.(txt|doc|docx|swf)$/,
                use: 'file-loader?name=[path][name].[ext]'
            },
            {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                use: 'url-loader?limit=10&minetype=image/svg+xml'
            },
            {
                test: /\.css$/,
                use: formatStyleLoader()
            },
            {
                test: /\.scss/,
                exclude: excludeRegex,
                use: formatStyleLoader({
                    loader: 'sass-loader',
                    options: {
                        sourceMap: true
                    }
                })
            },
            {
                loader: 'babel-loader',
                exclude: [
                    excludeRegex,
                ],
                test: /\.jsx?$/,
                options: {
                    presets: [
                        ['env', {
                            // 根据browserslist来分析支持情况， 具体的配置参照： https://github.com/ai/browserslist
                            browsers: [
                                "last 2 versions",
                                "ie >= 8",
                            ],
                            modules: false,
                            useBuiltIns: true,
                            debug: true
                        }],
                        'react',
                        'stage-0'
                    ],
                    plugins: [
                        ['transform-decorators-legacy', 'transform-decorators']	// 支持es7的装饰器
                    ]
                }
            }
        ]
    },

    plugins: [
        // 第一个参数vendor和entry中verdor名称对应，第二个参数是输出的文件名
        new CommonsChunkPlugin({name: 'vendor', filename: '[name].js'}),

        // 自动加载赋值模块
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        }),

        // 提取文本
        new ExtractTextPlugin({
            filename: 'vendor.css?[hash]-[chunkhash]-[contenthash]-[name]',
            disable: false,
            allChunks: true
        }),

        // 开发环境和生产环境配置
        new webpack.DefinePlugin({
            'process.env': {
                /* eslint eqeqeq: 0 */
                // 控制如react、react-dom等第三方包的warnning输出,设置为production将不输出warnning
                NODE_ENV: process.env.BUILD_DEV == 1 ? '"dev"' : '"production"'
            },
            // __DEV__是可在业务代码中使用变量，用于做些只在开发环境
            __DEV__: JSON.stringify(JSON.parse(process.env.BUILD_DEV))
        })
    ]
};
