#!/usr/bin/env python3
import requests
import sys
import json
from datetime import datetime, timedelta

class TaskManagerAPITester:
    def __init__(self, base_url="https://notetask-19.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.created_tasks = []
        self.created_categories = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if not success:
                details += f", Expected: {expected_status}"
                if response.text:
                    try:
                        error_data = response.json()
                        details += f", Error: {error_data.get('detail', response.text[:100])}"
                    except:
                        details += f", Response: {response.text[:100]}"

            self.log_test(name, success, details)
            
            if success:
                try:
                    return response.json() if response.text else {}
                except:
                    return {}
            return {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return {}

    def test_categories_api(self):
        """Test categories endpoints"""
        print("\n🔍 Testing Categories API...")
        
        # Test GET /api/categories (should return default categories)
        categories = self.run_test(
            "GET /api/categories - Get default categories",
            "GET", "categories", 200
        )
        
        if categories:
            print(f"   Found {len(categories)} categories")
            default_categories = [cat for cat in categories if cat.get('is_default')]
            if len(default_categories) >= 4:
                self.log_test("Default categories present", True, f"Found {len(default_categories)} default categories")
            else:
                self.log_test("Default categories present", False, f"Only found {len(default_categories)} default categories")

        # Test POST /api/categories - Create new category
        new_category_data = {
            "name": f"Test Category {datetime.now().strftime('%H%M%S')}",
            "color": "#FF5733"
        }
        
        created_category = self.run_test(
            "POST /api/categories - Create new category",
            "POST", "categories", 200, new_category_data
        )
        
        if created_category and 'id' in created_category:
            self.created_categories.append(created_category['id'])
            print(f"   Created category with ID: {created_category['id']}")

    def test_tasks_api(self):
        """Test tasks endpoints"""
        print("\n🔍 Testing Tasks API...")
        
        # Test GET /api/tasks (empty initially)
        tasks = self.run_test(
            "GET /api/tasks - Get all tasks",
            "GET", "tasks", 200
        )
        
        if isinstance(tasks, list):
            print(f"   Found {len(tasks)} existing tasks")

        # Test POST /api/tasks - Create new task
        new_task_data = {
            "title": f"Test Task {datetime.now().strftime('%H%M%S')}",
            "description": "This is a test task created by automated testing",
            "status": "todo",
            "priority": "high",
            "due_date": (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d')
        }
        
        # Add category if we created one
        if self.created_categories:
            new_task_data["category_id"] = self.created_categories[0]
        
        created_task = self.run_test(
            "POST /api/tasks - Create new task",
            "POST", "tasks", 200, new_task_data
        )
        
        if created_task and 'id' in created_task:
            task_id = created_task['id']
            self.created_tasks.append(task_id)
            print(f"   Created task with ID: {task_id}")
            
            # Test GET /api/tasks/{id} - Get specific task
            retrieved_task = self.run_test(
                f"GET /api/tasks/{task_id} - Get specific task",
                "GET", f"tasks/{task_id}", 200
            )
            
            if retrieved_task:
                # Verify task data
                if retrieved_task.get('title') == new_task_data['title']:
                    self.log_test("Task data integrity", True, "Title matches")
                else:
                    self.log_test("Task data integrity", False, "Title mismatch")
            
            # Test PUT /api/tasks/{id} - Update task status
            update_data = {"status": "in_progress"}
            updated_task = self.run_test(
                f"PUT /api/tasks/{task_id} - Update task status",
                "PUT", f"tasks/{task_id}", 200, update_data
            )
            
            if updated_task and updated_task.get('status') == 'in_progress':
                self.log_test("Task status update", True, "Status changed to in_progress")
            else:
                self.log_test("Task status update", False, "Status not updated correctly")
            
            # Test completing task
            complete_data = {"status": "done"}
            completed_task = self.run_test(
                f"PUT /api/tasks/{task_id} - Complete task",
                "PUT", f"tasks/{task_id}", 200, complete_data
            )
            
            if completed_task and completed_task.get('status') == 'done':
                self.log_test("Task completion", True, "Task marked as done")
                if completed_task.get('completed_at'):
                    self.log_test("Completion timestamp", True, "completed_at field set")
                else:
                    self.log_test("Completion timestamp", False, "completed_at field not set")

    def test_stats_api(self):
        """Test stats endpoint"""
        print("\n🔍 Testing Stats API...")
        
        stats = self.run_test(
            "GET /api/stats - Get task statistics",
            "GET", "stats", 200
        )
        
        if stats:
            required_fields = ['total', 'todo', 'in_progress', 'done', 'high_priority']
            missing_fields = [field for field in required_fields if field not in stats]
            
            if not missing_fields:
                self.log_test("Stats fields complete", True, f"All required fields present: {required_fields}")
                print(f"   Stats: {stats}")
            else:
                self.log_test("Stats fields complete", False, f"Missing fields: {missing_fields}")

    def test_filtering(self):
        """Test task filtering"""
        print("\n🔍 Testing Task Filtering...")
        
        # Test filter by status
        todo_tasks = self.run_test(
            "GET /api/tasks?status=todo - Filter by status",
            "GET", "tasks", 200, params={"status": "todo"}
        )
        
        if isinstance(todo_tasks, list):
            self.log_test("Status filtering", True, f"Found {len(todo_tasks)} todo tasks")
        
        # Test filter by priority
        high_priority_tasks = self.run_test(
            "GET /api/tasks?priority=high - Filter by priority",
            "GET", "tasks", 200, params={"priority": "high"}
        )
        
        if isinstance(high_priority_tasks, list):
            self.log_test("Priority filtering", True, f"Found {len(high_priority_tasks)} high priority tasks")

    def cleanup(self):
        """Clean up created test data"""
        print("\n🧹 Cleaning up test data...")
        
        # Delete created tasks
        for task_id in self.created_tasks:
            self.run_test(
                f"DELETE /api/tasks/{task_id} - Cleanup task",
                "DELETE", f"tasks/{task_id}", 200
            )
        
        # Delete created categories (non-default only)
        for category_id in self.created_categories:
            self.run_test(
                f"DELETE /api/categories/{category_id} - Cleanup category",
                "DELETE", f"categories/{category_id}", 200
            )

    def run_all_tests(self):
        """Run all API tests"""
        print(f"🚀 Starting Task Manager API Tests")
        print(f"Backend URL: {self.base_url}")
        print("=" * 60)
        
        try:
            # Test basic connectivity
            response = requests.get(f"{self.api_url}/", timeout=10)
            if response.status_code == 200:
                self.log_test("API connectivity", True, "Backend is reachable")
            else:
                self.log_test("API connectivity", False, f"Status: {response.status_code}")
                return
        except Exception as e:
            self.log_test("API connectivity", False, f"Connection failed: {str(e)}")
            return

        # Run test suites
        self.test_categories_api()
        self.test_tasks_api()
        self.test_stats_api()
        self.test_filtering()
        
        # Cleanup
        self.cleanup()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("❌ Some tests failed!")
            failed_tests = [result for result in self.test_results if not result['success']]
            print("\nFailed tests:")
            for test in failed_tests:
                print(f"  - {test['test']}: {test['details']}")
            return 1

def main():
    tester = TaskManagerAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())