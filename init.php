<?php

add_filter('manage_posts_columns', 'sortable_columns_head', 10, 2);
add_filter('manage_pages_columns', 'sortable_columns_head', 10, 2);
function sortable_columns_head( $columns, $post_type = 'pages' ) {

	// enable sortable only when no query parameters are present, except a post_type
	$serialized_query = implode( array_keys( $_REQUEST ) );

	if (
		!current_user_can('edit_others_posts') ||
		( $serialized_query !== '' && $serialized_query !== 'post_type' ) ||
		!post_type_supports( $post_type, 'sortable' )
	) {
		return $columns;
	}

	// put the sortable column at the beginning of the colmns array
	$new_columns = array(
		'sortable' => '↕'
	);

	foreach ( $columns as $key => $value ) {
		$new_columns[ $key ] = $value;
	}

	return $new_columns;
}

add_action('manage_posts_custom_column', 'sortable_columns_content', 0);
add_action('manage_pages_custom_column', 'sortable_columns_content', 0);
function sortable_columns_content( $column ) {
	switch ( $column ) {
		case 'sortable' :
			echo '<span class="sp-sortable-handle"></span>';
			break;
	}
}

// we need the post_parent as a class-name
add_filter('post_class', 'sortable_additional_post_class', 10, 3);
function sortable_additional_post_class( $classes, $class, $post_ID ) {
	$post = get_post( $post_ID );

	array_push( $classes, 'post-parent-' . $post->post_parent );

	return $classes;
}

add_action( 'admin_init', 'enqueue_sortable_stylesheet' );
function enqueue_sortable_stylesheet() {
	// Respects SSL, Style.css is relative to the current file
	wp_register_style( 'sortable-style', get_template_directory_uri() . '/Sortable-Posts/style.css' );
	wp_enqueue_style( 'sortable-style' );

	wp_register_script( 'sortable-script', get_template_directory_uri() . '/Sortable-Posts/script.js', array('jquery'), false, true );
	wp_enqueue_script( 'sortable-script' );
}


add_action('wp_ajax_posts_order', 'posts_order_callback');
function posts_order_callback() {

	if ( current_user_can('edit_others_posts') ) {

		foreach( $_POST['new_order'] as $post_ID => $menu_order ) {
			wp_update_post( array(
				'ID' => intval( $post_ID ),
				'menu_order' => intval( $menu_order )
			));
		}

	}

	die(); // this is required to return a proper result
}

?>