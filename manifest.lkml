project_name: "changeme"

application: looker_dashboard_comments {
  label: "Dashboards + Comments"
  # file: "looker_dashboard_comments.js"
  url: "http://localhost:8080/bundle.js"
  entitlements: {
    local_storage: no
    navigation: yes
    new_window: yes
    use_form_submit: yes
    use_embeds: no
    core_api_methods: []
  }
}
