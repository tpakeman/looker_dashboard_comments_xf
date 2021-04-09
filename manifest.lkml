project_name: "changeme"

application: looker_dashboard_comments {
  label: "Dashboards + Comments"
  # file: "looker_dashboard_comments.js" # For prod
  url: "http://localhost:8080/bundle.js" # For dev
  entitlements: {
    local_storage: no
    navigation: yes
    new_window: yes
    use_form_submit: yes
    use_embeds: yes
    core_api_methods: ["all_folders", "folder_dashboards", "me", "update_dashboard"]
  }
}