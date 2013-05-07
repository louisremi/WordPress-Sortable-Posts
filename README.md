WordPress-Sortable-Posts
========================

Reorder posts with drag-and-drop right from the post-list.

![Screenshot of the plugin](https://raw.github.com/louisremi/WordPress-Sortable-Posts/master/screenshot.png)

Short example
-------------

```php
/* Sortable should be added as a capability to post-types.
 * The following code should be placed in a theme's functions.php
 */
include 'WordPress-Sortable-Posts/init.php';

add_action( 'init', function() {
	// Adding sortable capability to a custom post-type
	register_post_type( 'custom', array(
		'public' => true,
		'supports' => array(
			'sortable'
		)
	));

	// Adding sortable capability to a built-in post-type
	add_post_type_support( 'pages', array( 'sortable' ) );
});
```

Installation & Usage
--------------------

1. Place `WordPress-Sortable-Posts` directory inside of your current theme.
2. Include `init.php` at the beginning of `functions.php`.
3. Add sortable capability to post types.

This plugin has been tested with WordPress 3.5

Credits & License
-----------------

GPLv3 licensed by [@louis_remi](http://twitter.com/louis_remi)

Are you using this in a paid work?  
Send me music http://www.amazon.co.uk/wishlist/HNTU0468LQON
